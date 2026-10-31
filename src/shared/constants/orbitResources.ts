export interface HelplineResource {
  name: string;
  numbers: string[];
  displayNumber: string;
  description: string;
}

export const ORBIT_RESOURCES: HelplineResource[] = [
  {
    name: 'National Emergency Number',
    numbers: ['112'],
    displayNumber: '112',
    description: 'Immediate emergency response across India',
  },
  {
    name: 'Tele-MANAS (Ministry of Health and Family Welfare)',
    numbers: ['14416'],
    displayNumber: '14416',
    description: '24/7 toll-free comprehensive mental health service',
  },
  {
    name: 'Vandrevala Foundation',
    numbers: ['+919999666555', '7304599837'],
    displayNumber: '+91 9999 666 555 or 7304599837',
    description: '24/7 free mental health counseling and crisis intervention',
  },
  {
    name: 'KIRAN (Mental Health Rehabilitation Helpline)',
    numbers: ['18005990019'],
    displayNumber: '1800-599-0019',
    description: '24/7 mental health rehabilitation and crisis support',
  },
];
