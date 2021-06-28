import useMongo, { closeConnection } from "../../../helpers/useMongo";
import quiz from "../../../models/quiz";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer";

import parser from "../../../helpers/upload/fileParser";
import awsUploader from "../../../helpers/upload/awsUploader";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const { quiz_id, question_id } = event.pathParameters;

  let conn;
  const uploadedEvidence = {};

  try {
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);

    const { image, audio, text } = await parser(event);

    conn = await useMongo();
    const Quiz = quiz(conn);
    const CurrentQuiz = await Quiz.findById(quiz_id).lean();

    if (!CurrentQuiz) throw Error("Invalid no quiz for this property");
    console.log(CurrentQuiz);

    if (image) {
      const awsFile = await awsUploader(
        { file: image },
        { id: CurrentQuiz._id, folder: "quiz" }
      );

      const newImage = {
        imageName: image.filename,
        s3uri: awsFile.Location,
        s3key: awsFile.Key
      };

      if (CurrentQuiz.questions.find(i => i.question_id === question_id)) {
        const questionIndex = CurrentQuiz.questions.findIndex(
          i => i.question_id === question_id
        );
        CurrentQuiz.questions[questionIndex].evidences.images.push(newImage);
      } else {
        const newQuestion = {
          question_id,
          checked: false,
          evidences: {
            images: [newImage],
            audios: [],
            text: ""
          }
        };
        CurrentQuiz.questions.push(newQuestion);
      }

      uploadedEvidence.image = newImage;
      await Quiz.updateOne({ _id: CurrentQuiz._id }, CurrentQuiz);
    }

    if (audio) {
      const awsFile = await awsUploader(
        { file: audio },
        { id: CurrentQuiz._id, folder: "quiz" }
      );

      const newAudio = {
        audioName: audio.filename,
        s3uri: awsFile.Location,
        s3key: awsFile.Key
      };

      if (CurrentQuiz.questions.find(i => i.question_id === question_id)) {
        const questionIndex = CurrentQuiz.questions.findIndex(
          i => i.question_id === question_id
        );
        CurrentQuiz.questions[questionIndex].evidences.audios.push(newAudio);
      } else {
        const newQuestion = {
          question_id,
          checked: false,
          evidences: {
            images: [],
            audios: [newAudio],
            text: ""
          }
        };
        CurrentQuiz.questions.push(newQuestion);
      }

      uploadedEvidence.audio = newAudio;
      await Quiz.updateOne({ _id: CurrentQuiz._id }, CurrentQuiz);
    }

    if (text) {
      if (CurrentQuiz.questions.find(i => i.question_id === question_id)) {
        const questionIndex = CurrentQuiz.questions.findIndex(
          i => i.question_id === question_id
        );
        CurrentQuiz.questions[questionIndex].evidences.text = text;
      } else {
        const newQuestion = {
          question_id,
          checked: false,
          evidences: {
            images: [],
            audios: [],
            text: text
          }
        };
        CurrentQuiz.questions.push(newQuestion);
      }

      uploadedEvidence.text = text;
      await Quiz.updateOne({ _id: CurrentQuiz._id }, CurrentQuiz);
    }

    const found = await Quiz.findOne({ _id: CurrentQuiz._id }).lean();

    await closeConnection(conn);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({ quiz: found, uploadedEvidence })
    };
  } catch (error) {
    if (conn) {
      await closeConnection(conn);
    }

    console.log(error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify(error.message)
    };
  }
};
