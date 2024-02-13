import {text} from "express";
import texts from "../texts.js";

/**
 * Splits a sentence into an array of words. The function considers spaces, commas, periods, exclamation marks, and question marks as delimiters.
 *
 * @param {string} sentence - The sentence to be chopped into words.
 * @returns {string[]} An array of words obtained from the sentence. Each word includes the trailing delimiter, if any.
 *
 * @example
 * // returns ['Hello,', ' world!']
 * ChopSentence('Hello, world!')
 */
export const  ChopSentence = (sentence) => {
    let choppedSentence = []
    let word = ""
    for (let i = 0; i < sentence.length; i++) {
        if (sentence[i] === " " || sentence[i] === "," || sentence[i] === "." || sentence[i] === "!" || sentence[i] === "?") {
            word += sentence[i]
            choppedSentence.push(word)
            word = ""
        } else {
            word += sentence[i]
        }
    }
    choppedSentence.push(word)
    return choppedSentence
}
export const GetRandomTextBasedOnTheme = (theme) => {
    if(texts[theme] === undefined) return null;
    let random = Math.floor(Math.random() * texts[theme].length)
    return texts[theme][random]
}