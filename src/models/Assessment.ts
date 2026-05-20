import mongoose, { Schema, Document } from 'mongoose';

export type QuestionType = 'likert' | 'multiple_choice';

export interface IQuestionOption {
  value: number;
  label: string;
}

export interface IQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options: IQuestionOption[];
}

export interface IAssessment extends Document {
  title: string;
  description: string;
  category: string;
  questionCount: number;
  estimatedMinutes: number;
  questions: IQuestion[];
}

const QuestionOptionSchema = new Schema<IQuestionOption>(
  {
    value: { type: Number, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

const QuestionSchema = new Schema<IQuestion>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, enum: ['likert', 'multiple_choice'], required: true },
    options: { type: [QuestionOptionSchema], default: [] },
  },
  { _id: false }
);

const AssessmentSchema = new Schema<IAssessment>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    questionCount: { type: Number, default: 0 },
    estimatedMinutes: { type: Number, default: 5 },
    questions: { type: [QuestionSchema], default: [] },
  },
  { timestamps: true }
);

export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);
