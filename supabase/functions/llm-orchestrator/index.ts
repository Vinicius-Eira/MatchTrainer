import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { JobService } from "./services/job-service.ts";
import { GeminiProvider } from "./providers/gemini-provider.ts";

serve(async (req) => {
  try {
    const jobService = new JobService();
    const aiProvider = new GeminiProvider();

    const job = await jobService.claimNextJob();
    if (!job) {
      return new Response(JSON.stringify({ message: "Nenhum job pendente no momento." }), { status: 200 });
    }

    try {
      const context = await jobService.getJobContext(job.insight_id);

      const aiResult = await aiProvider.generateSuggestion(context);

       await jobService.completeJob(job, aiResult, context);

      return new Response(JSON.stringify({ success: true, job_id: job.id }), { status: 200 });

    } catch (processError: any) {
      // Falha Isolada do Job
      await jobService.failJob(job, processError.message);
      throw processError;
    }

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});