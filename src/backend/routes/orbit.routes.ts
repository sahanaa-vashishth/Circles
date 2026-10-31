import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { guardianCheck, type GuardianSession } from '../guardian/guardianCheck.ts';
import { ORBIT_RESOURCES } from '../../shared/constants/orbitResources.ts';

const router = Router();

router.post('/chat', async (req: Request, res: Response) => {
  const { text, history, session } = req.body;

  // Validate that text is a non-empty string. Return 400 if not.
  if (typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid request: "text" must be a non-empty string.',
    });
  }

  // Run guardian check before model invocation
  const guardianResult = guardianCheck(text, session as GuardianSession);

  // If level is 3 or (level is 2 and showCard is true): do NOT call Gemini.
  const shouldBlockForCard =
    guardianResult.level === 3 ||
    (guardianResult.level === 2 && guardianResult.showCard);

  if (shouldBlockForCard) {
    console.log(
      `[Orbit] Risk Level: ${guardianResult.level}, Gemini called: false, showCard: ${guardianResult.showCard}`
    );

    const isLevel3 = guardianResult.level === 3;
    const fixedText = isLevel3
      ? 'I hear how painful this is. Please reach out to emergency help or someone with you right now.'
      : 'Thank you for telling me this. You do not have to carry it alone.';

    const card = {
      heading: isLevel3
        ? 'Immediate Support & Crisis Helplines'
        : 'Support & Helpline Resources',
      steps: isLevel3
        ? [
            'Call 112 or Tele-MANAS 14416 now',
            'Stay near someone',
            'Move anything harmful out of reach',
          ]
        : [
            'Call Tele-MANAS 14416 or Vandrevala',
            'Stay near someone you trust',
            'Tell me if you are safe right now',
          ],
      helplines: ORBIT_RESOURCES,
    };

    return res.status(200).json({
      success: true,
      data: {
        text: fixedText,
        card,
        guardianSession: guardianResult.session,
        riskLevel: guardianResult.level,
      },
    });
  }

  // Otherwise (Level 1, or Level 2 with the card already shown): call Gemini
  console.log(
    `[Orbit] Risk Level: ${guardianResult.level}, Gemini called: true, showCard: false`
  );

  // Keep the last 6 entries of history, keeping only items with role "user" or "orbit"
  const filteredHistory = Array.isArray(history)
    ? history
        .filter(
          (item: any) =>
            item &&
            (item.role === 'user' || item.role === 'orbit') &&
            typeof item.text === 'string'
        )
        .slice(-6)
    : [];

  // Build Gemini contents array from sanitized history + current text
  const contents: Array<{ role: 'user' | 'model'; parts: { text: string }[] }> = [];

  for (const item of filteredHistory) {
    const role: 'user' | 'model' = item.role === 'orbit' ? 'model' : 'user';

    // Gemini conversation must start with a 'user' turn
    if (contents.length === 0 && role === 'model') {
      continue;
    }

    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += `\n${item.text}`;
    } else {
      contents.push({
        role,
        parts: [{ text: item.text }],
      });
    }
  }

  // Append current user prompt
  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    contents[contents.length - 1].parts[0].text += `\n${text.trim()}`;
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: text.trim() }],
    });
  }

  const startTime = Date.now();

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let systemInstruction =
      'You are Orbit, a calm, warm, non-judgmental listener in a mental wellbeing app. Reply in 2 to 4 short sentences. Refer to what the user actually said. Ask at most one question. Do not give medical advice or diagnoses.';

    // Append extra safety text when a session is active
    if (guardianResult.session.active) {
      systemInstruction +=
        ' The user has an active safety concern. Respond warmly to exactly what they said. Keep a gentle check on whether they are safe right now and whether they are alone. Do not repeat a helpline card. Do not give advice about medication or methods.';
    }

    let timeoutHandle: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error('Gemini call timed out after 15 seconds'));
      }, 15000);
    });

    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'];
    let response: any = null;
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        response = await Promise.race([
          ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
              maxOutputTokens: 300,
            },
          }),
          timeoutPromise,
        ]);
        if (response?.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (timeoutHandle) clearTimeout(timeoutHandle);

    if (!response || !response.text) {
      throw lastError || new Error('No response from Gemini models');
    }

    const duration = Date.now() - startTime;
    console.log(`[Orbit] Gemini call completed in ${duration}ms`);

    const replyText = response.text || '';

    return res.status(200).json({
      success: true,
      data: {
        text: replyText,
        card: null,
        guardianSession: guardianResult.session,
        riskLevel: guardianResult.level,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Orbit] Gemini call error after ${duration}ms:`, error);

    // If session is safety-flagged/active, return a fixed check-in line rather than generic error
    if (guardianResult.session.active) {
      return res.status(200).json({
        success: true,
        data: {
          text: 'I am right here with you. Please take a gentle breath—are you safe and is someone near you right now?',
          card: null,
          guardianSession: guardianResult.session,
          riskLevel: guardianResult.level,
        },
      });
    }

    return res.status(200).json({
      success: false,
      text: 'I am having trouble responding right now. Please try again in a moment.',
      data: {
        text: 'I am having trouble responding right now. Please try again in a moment.',
        card: null,
        guardianSession: guardianResult.session,
        riskLevel: guardianResult.level,
      },
    });
  }
});

export default router;
