import mongoose, { Schema, Document, Types } from 'mongoose';

export type Severity = 'minimal' | 'mild' | 'moderate' | 'severe';

export interface IAssessmentResult extends Document {
  user: Types.ObjectId;
  assessment: Types.ObjectId;
  assessmentTitle: string;
  answers: Record<string, number>;
  score: number;
  maxScore: number;
  percentage: number;
  severity: Severity;
  interpretation: string;
  recommendations: string[];
  completedAt: Date;
}

const AssessmentResultSchema = new Schema<IAssessmentResult>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assessment: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
    assessmentTitle: { type: String, required: true },
    answers: { type: Schema.Types.Mixed, default: {} },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    percentage: { type: Number, required: true },
    severity: { type: String, enum: ['minimal', 'mild', 'moderate', 'severe'], required: true },
    interpretation: { type: String, default: '' },
    recommendations: { type: [String], default: [] },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const AssessmentResult = mongoose.model<IAssessmentResult>(
  'AssessmentResult',
  AssessmentResultSchema
);
