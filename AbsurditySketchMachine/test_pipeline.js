// Test script for the fully automated pipeline

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, serviceRoleKey)

async function testPipeline() {
  console.log("Starting pipeline test...");

  // 1. Generate an idea
  console.log("Generating idea...");
  const ideaResponse = await fetch(`${supabaseUrl}/functions/v1/generate-idea`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
  });
  console.log("ideaResponse:", ideaResponse);

  if (!ideaResponse.ok) {
      const errorBody = await ideaResponse.text();
      throw new Error(`Failed to generate an idea. Status: ${ideaResponse.status}, Body: ${errorBody}`);
  }

  const idea = await ideaResponse.json();
  console.log("Idea generated:", idea);

  // 2. Build the prompt package
  console.log("Building prompt package...");
  const promptPackageResponse = await fetch(`${supabaseUrl}/functions/v1/build-prompt-package`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(idea)
  });

  if (!promptPackageResponse.ok) {
      const errorBody = await promptPackageResponse.text();
      throw new Error(`Failed to build the prompt package. Status: ${promptPackageResponse.status}, Body: ${errorBody}`);
  }

  const promptPackage = await promptPackageResponse.json();
  console.log("Prompt package built:", promptPackage);

  // 3. Generate a new sketch
  console.log("Generating new sketch...");
  const sketchResponse = await fetch(`${supabaseUrl}/functions/v1/generate-sketch`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
  });

  if (!sketchResponse.ok) {
      const errorBody = await sketchResponse.text();
      throw new Error(`Failed to generate a new sketch. Status: ${sketchResponse.status}, Body: ${errorBody}`);
  }

  const sketch = await sketchResponse.json();
  console.log("Sketch generated:", sketch);

  // 4. Poll the sketches table
  console.log("Polling sketches table...");
  let sketchRecord = null;
  for (let i = 0; i < 10; i++) {
      const { data, error } = await supabase
          .from('sketches')
          .select('*')
          .eq('id', sketch.job_id)
          .single();

      if (error) {
          throw error;
      }

      if (data.status === 'complete') {
          sketchRecord = data;
          break;
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
  }

  if (sketchRecord) {
      console.log("Pipeline test successful!");
      console.log("Generated sketch:", sketchRecord);
  } else {
      throw new Error("Pipeline test failed: sketch generation timed out.");
  }
}

testPipeline().catch(console.error);
