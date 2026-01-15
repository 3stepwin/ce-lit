// SIMPLIFIED NOVITA PAYLOAD - Copy this into generate-sketch/index.ts around line 560

const novitaPayload = {
    prompt: condensedPrompt,
    height: 1024,
    width: 576,
    duration: "10",
    cfg_scale: 0.5,
    extra: {
        webhook: {
            url: webhookUrl
        }
    }
};

console.log("Submitting to Novita txt2video:", record.id);
console.log("Prompt length:", condensedPrompt.length, "chars");
