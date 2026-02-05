# PromptGLot: Linguistic Logic Context

## 1. Project Overview
**PromptGLot** is a high-precision image editing application designed to solve the "Multimodal Negation Gap." While modern Image AI models (like Nano Banana Pro) are powerful, they often fail to grasp the specific grammatical structures of non-English languages—most notably **negative concords** (double negatives) in Afrikaans and **separable verbs** in German.

PromptGLot uses the **Lingo.dev SDK** as a "Linguistic Logic Middleware" to ensure that the user's intent is perfectly translated into visual actions.

---

## 2. The Problem: The "Afrikaans Paradox"
In Afrikaans, negation is typically bipartite. 
* **User Input:** *"Daar moet geen vrugte op die tafel wees nie."*
* **Literal AI Translation:** "There must no fruit on the table be not."
* **Standard AI Failure:** The model detects the word "fruit" twice (once via the noun, once via the double negative structure) and often *includes* the fruit in the generated image instead of removing it.

---

## 3. System Architecture
PromptGLot moves away from "Black Box" translation and adopts a structured **Refine-and-Render** pipeline.



### Workflow Stages:
1.  **Input:** User provides a natural language command (e.g. German or Afrikaans).
2.  **Lingo.dev Intercept:** The SDK identifies the locale and applies a **Logic Schema**.
3.  **Normalisation:** The SDK resolves complex grammar into a "Global English" command string.
4.  **Visual Execution:** The cleaned command is sent to the Image AI for in-painting or generation.

---

## 4. Logic Mapping Table
Lingo.dev allows us to map specific linguistic patterns to **Logical Tokens**.

| Feature | Source Language Structure | Logical Intent | Refined Output (English) |
| :--- | :--- | :--- | :--- |
| **Negative Concord** | *Geen ... nie* (Afrikaans) | `ACTION_REMOVE` | "Remove all [object]" |
| **Separable Verbs** | *... räumt ... auf* (German) | `ACTION_CLEAN` | "Clear and organise [area]" |
| **Diminutives** | *Hondjie* (Afrikaans) | `SCALE_SMALL` | "A very small dog" |

---

## 5. SDK Implementation Strategy
The following TypeScript logic is used to bridge the gap between the **PromptGLot UI** and the **Lingo.dev Dashboard**.

```typescript
/**
 * Resolves native language nuances into structured AI commands.
 */
async function resolvePromptLogic(rawPrompt: string) {
  // Lingo.dev acts as the intelligence layer
  const result = await lingo.resolve({
    source: rawPrompt,
    context: "image_editor_v1",
    rules: ["resolve_double_negatives", "extract_visual_subjects"]
  });

  return {
    refinedCommand: result.translation, // "Remove the fruit bowl"
    analysis: result.metadata.logic_trail, // "Afrikaans Double Negative -> Negation"
    confidence: result.score
  };
}

## 6. Hackathon Value Proposition
* **Localisation as Logic:** We aren't just localising text; we are localising **intent**.
* **Explainable AI:** By using the `Linguistic Analysis` sidebar in the UI, we show the user exactly how the SDK resolved their native grammar.
* **Scalability:** New languages can be added via the Lingo.dev dashboard without rewriting the core Image AI integration.