import {
    toTypedRxJsonSchema,
    ExtractDocumentTypeFromTypedRxJsonSchema,
    RxJsonSchema
} from 'rxdb';


export const diaryEntrySchemaLiteral = {
    version: 0,
    title: 'diary entry',
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 36 // <- the primary key must have set maxLength
        },
        day: {
            type: 'number',
            'minimum': 1,
            'maximum': 31,
            'multipleOf': 1
        },
        month: {
            type: 'number',
            'minimum': 1,
            'maximum': 12,
            'multipleOf': 1
        },
        year: {
            type: 'number',
            'minimum': 1950,
            'maximum': 2100,
            'multipleOf': 1
        },
        feeling: {
            type: 'string',
            maxLength: 30
        },
        content: {
            type: 'string'
        },
        user_id: {
            type: 'string',
            maxLength: 36,
        },
    },
    indexes: [
        ['day', 'month', 'year']
    ],
    required: ['day', 'month', 'year', 'user_id']
} as const;

const schemaTyped = toTypedRxJsonSchema(diaryEntrySchemaLiteral);
export type RxDiaryEntryDocumentType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTyped>;
export const diaryEntrySchema: RxJsonSchema<RxDiaryEntryDocumentType> = diaryEntrySchemaLiteral;