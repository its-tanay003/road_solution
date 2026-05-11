import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function runVisionAgent(imageBase64: string, context?: string, patientProfile?: any) {
  if (!imageBase64) return null;

  const [mediaType, base64Data] = imageBase64.split(',');
  const mediaTypeValue = mediaType.split(':')[1].split(';')[0];

  const prompt = `You are an emergency medical vision AI. Analyze this image of a potentially injured person.
        
Identify and report:
1. VISIBLE INJURIES: Location, type (laceration/fracture/burn/bruising/swelling), estimated severity
2. CONSCIOUSNESS: Awake and alert / Confused / Unconscious / Unknown
3. BREATHING: Visible chest movement, labored breathing signs
4. SKIN: Pallor (pale), cyanosis (blue lips/fingertips), flushing, diaphoresis (sweating)
5. BODY POSITION: How they are lying, any unnatural limb positions
6. BLEEDING: Visible blood, estimated amount (minor/moderate/severe)
7. ENVIRONMENT: Any visible hazards (fire, water, traffic, electrical)
8. AGE ESTIMATE: Approximate age range

Output as JSON only, no markdown:
{
  "consciousnessLevel": "ALERT|CONFUSED|UNCONSCIOUS|UNKNOWN",
  "visibleInjuries": [{"location": "", "type": "", "severity": "MINOR|MODERATE|SEVERE"}],
  "breathing": "NORMAL|LABORED|ABSENT|UNKNOWN",
  "skinCondition": [],
  "bleeding": "NONE|MINOR|MODERATE|SEVERE",
  "bodyPosition": "",
  "estimatedAge": "",
  "environmentalHazards": [],
  "overallSeverity": "CRITICAL|SERIOUS|MODERATE|MINOR",
  "confidenceScore": 0-100,
  "immediateVisionConcerns": [],
  "limitationsNote": ""
}

Context from caller: ${context || 'Road traffic accident reported'}
${patientProfile ? 'Known patient conditions: ' + JSON.stringify(patientProfile.conditions || patientProfile) : ''}`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaTypeValue as any, data: base64Data }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      }
    ]
  });

  const fullResponse = (response.content[0] as any).text;

  try {
    // Attempt to extract JSON if it's wrapped in markers or not
    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : fullResponse;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse VisionAgent output:', fullResponse);
    return { error: 'Failed to parse JSON', raw: fullResponse };
  }
}
