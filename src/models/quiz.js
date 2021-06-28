import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";

const schema = new Schema(
  {
    property_id: { type: Schema.Types.ObjectId, ref: "properties" },
    questions: [
      {
        question_id: String,
        checked: { type: Boolean, default: false },
        evidences: {
          text: String,
          images: [{ imageName: String, s3uri: String, s3key: String }],
          audios: [{ audioName: String, s3uri: String, s3key: String }]
        }
      }
    ]
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true
    }
  }
);
schema.plugin(mongoosePaginate);

export default conn => conn.model("quizzes", schema, "quizzes");
