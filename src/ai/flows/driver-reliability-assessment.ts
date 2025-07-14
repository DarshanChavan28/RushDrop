// src/ai/flows/driver-reliability-assessment.ts
'use server';

/**
 * @fileOverview Assesses the reliability of a driver based on their history and ratings.
 *
 * - assessDriverReliability - A function that assesses driver reliability.
 * - AssessDriverReliabilityInput - The input type for the assessDriverReliability function.
 * - AssessDriverReliabilityOutput - The return type for the assessDriverReliability function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessDriverReliabilityInputSchema = z.object({
  driverHistory: z
    .string()
    .describe('The driver history, including past trips and any incidents.'),
  studentRatings: z
    .string()
    .describe('Student ratings and reviews of the driver.'),
});

export type AssessDriverReliabilityInput = z.infer<
  typeof AssessDriverReliabilityInputSchema
>;

const AssessDriverReliabilityOutputSchema = z.object({
  reliabilityScore: z
    .number()
    .describe(
      'A score from 0 to 1 indicating the reliability of the driver, with 1 being the most reliable.'
    ),
  riskFactors: z
    .string()
    .describe(
      'A summary of any risk factors identified in the driver history and ratings.'
    ),
  recommendation: z
    .string()
    .describe(
      'A recommendation on whether or not to use this driver based on their reliability.'
    ),
});

export type AssessDriverReliabilityOutput = z.infer<
  typeof AssessDriverReliabilityOutputSchema
>;

export async function assessDriverReliability(
  input: AssessDriverReliabilityInput
): Promise<AssessDriverReliabilityOutput> {
  return assessDriverReliabilityFlow(input);
}

const assessDriverReliabilityFlow = ai.defineFlow(
  {
    name: 'assessDriverReliabilityFlow',
    inputSchema: AssessDriverReliabilityInputSchema,
    outputSchema: AssessDriverReliabilityOutputSchema,
  },
  async input => {
    // MOCK IMPLEMENTATION: Return static data instead of calling the AI model.
    return {
      reliabilityScore: 0.96,
      riskFactors: 'One minor late delivery due to traffic 3 months ago. No other significant risk factors identified.',
      recommendation: 'This driver has a strong track record and is highly recommended. Consistently high ratings and minimal issues suggest they are very reliable for deliveries.',
    };
  }
);
