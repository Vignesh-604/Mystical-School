import assert from "node:assert/strict";
import { test } from "node:test";
import { screenMessage } from "../lib/guide/safety";

test("flags expressions of suicidal thoughts and self-harm", () => {
  for (const msg of [
    "Sometimes I think about killing myself",
    "I don't want to live anymore",
    "i want to die",
    "I've been cutting myself again",
    "everyone would be better off dead without me, me included",
    "I keep thinking about suicide",
  ]) {
    assert.equal(screenMessage(msg), "self_harm", msg);
  }
});

test("flags harm from others", () => {
  for (const msg of ["My husband hits me when he drinks", "I'm not safe at home", "he threatened to kill me"]) {
    assert.equal(screenMessage(msg), "harm_from_others", msg);
  }
});

test("flags medical emergencies and replacing treatment", () => {
  for (const msg of ["I have chest pain right now", "I stopped taking my medication to heal with energy", "Can I use reiki instead of chemo?"]) {
    assert.equal(screenMessage(msg), "medical", msg);
  }
});

test("does not flag ordinary spiritual conversation", () => {
  for (const msg of [
    "How do I begin meditating?",
    "What does the ego die to in mystical traditions?",
    "Tell me about the death of the self in Sufism",
    "I'm dying to try the retreat in Chartres!",
    "My practice is killing it this week",
    "What is the seed of life?",
  ]) {
    assert.equal(screenMessage(msg), null, msg);
  }
});
