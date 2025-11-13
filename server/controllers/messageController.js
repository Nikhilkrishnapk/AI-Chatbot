import axios from "axios";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import imagekit from "../configs/imagekit.js";
import openai from "../configs/openai.js";

// text based AI chat message controller.
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user_id;

    // check credits
    if (req.user.credits < 1) {
      return res.json({
        success: false,
        message: "You dont have enough credits to use this feature",
      });
    }

    const { chatId, prompt } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });

    chat.messages.push({
      role: "user",
      content: prompt,
      timeStamp: Date.now(),
      isImage: false,
    });

    // send prompt to AI.
    const { choices } = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // getting result from ai
    const reply = {
      ...choices[0].message,
      timeStamp: Date.now(),
      isImage: false,
    };

    // send result to user as reply
    res.json({ success: true, reply });

    // save the result in db
    chat.messages.push(reply);
    await chat.save();
    // deduct the credit.
    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Img generation message controller.
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    // check credits
    if (req.user.credits < 2) {
      return res.json({
        success: false,
        message: "You dont have enough credits to use this feature",
      });
    }

    const { prompt, chatId, isPublished } = req.body;
    // find chat of the particular user.
    const chat = await Chat.findOne({ userId, _id: chatId });

    // push user message.
    chat.messages.push({
      role: "user",
      content: prompt,
      timeStamp: Date.now(),
      isImage: false,
    });

    // Encode the prompt
    const encodedPrompt = encodeURIComponent(prompt);

    const generatedImageUrl = `${
      process.env.IMAGEKIT_URL_ENDPOINT
    }/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800`;

    console.log(generatedImageUrl);

    // trigger generation by fetching from imagekit.
    const aiImgaeResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });

    // conver to base64
    const base64Image = `data:image/png;base64,${Buffer.from(
      aiImgaeResponse.data,
      "binary"
    ).toString("base64")}`;

    // upload to imagekit media library.
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "quickgpt",
    });

    // getting result from ai
    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timeStamp: Date.now(),
      isImage: true,
      isPublished,
    };

    res.json({ success: true, reply });

    chat.messages.push(reply);
    await chat.save();
    // deduct the credit.
    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
