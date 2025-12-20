<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '@iconify/svelte';

  interface Author {
    name: string;
  }

  interface Paper {
    id: string;
    title: string;
    summary: string;
    publishedAt: string;
    authors: Author[];
  }

  let paper: Paper | null = null;
  let loading = true;
  let error: string | null = null;

  // Fallback paper (Attention Is All You Need)
  const fallbackPaper: Paper = {
    id: "1706.03762",
    title: "Attention Is All You Need",
    summary: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely...",
    publishedAt: "2017-06-12",
    authors: [{ name: "Ashish Vaswani" }, { name: "Noam Shazeer" }, { name: "Niki Parmar" }, { name: "et al." }]
  };

  onMount(async () => {
    try {
      // Use corsproxy.io to bypass CORS restrictions
      const response = await fetch('https://corsproxy.io/?url=https://huggingface.co/api/daily_papers');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      if (data && data.length > 0) {
        // The API returns an array of objects, each containing a 'paper' object
        const latest = data[0].paper;
        paper = {
            id: latest.id,
            title: latest.title,
            summary: latest.summary.replace(/\n/g, ' '),
            publishedAt: latest.publishedAt,
            authors: latest.authors
        };
      } else {
        throw new Error('No papers found');
      }
    } catch (e) {
      console.error("Failed to fetch daily paper:", e);
      error = "Could not load daily paper. Showing classic paper instead.";
      paper = fallbackPaper;
    } finally {
      loading = false;
    }
  });

  function getAuthors(authors: Author[]) {
    return authors.map(a => a.name).slice(0, 3).join(", ") + (authors.length > 3 ? " et al." : "");
  }

  function cleanSummary(text: string) {
    return text.length > 200 ? text.substring(0, 200) + "..." : text;
  }
</script>

<div class="w-full max-w-[var(--page-width)] mx-auto px-4 mb-16">
  <div class="relative overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-[#1a1a1a]/50 backdrop-blur-md p-6 sm:p-8 transition hover:border-[var(--primary)]/30 group">
    
    <!-- Background Decoration -->
    <div class="absolute -top-24 -right-24 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[var(--primary)]/10 transition duration-700"></div>

    <div class="relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
      
      <!-- Left: Content -->
      <div class="flex-1">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold uppercase tracking-wider mb-4 border border-[var(--primary)]/20">
          <Icon icon="material-symbols:local-fire-department-outline" class="text-base" />
          <span>Paper of the Day</span>
        </div>

        {#if loading}
            <div class="animate-pulse space-y-4">
                <div class="h-8 bg-black/10 dark:bg-white/10 rounded w-3/4"></div>
                <div class="h-4 bg-black/10 dark:bg-white/10 rounded w-1/2"></div>
                <div class="space-y-2">
                    <div class="h-3 bg-black/10 dark:bg-white/10 rounded"></div>
                    <div class="h-3 bg-black/10 dark:bg-white/10 rounded"></div>
                </div>
            </div>
        {:else if paper}
          <div class="animate-in fade-in duration-500">
            <h3 class="text-xl md:text-2xl font-bold text-black/90 dark:text-white/90 leading-tight mb-2 group-hover:text-[var(--primary)] transition duration-300">
              <a href={`https://huggingface.co/papers/${paper.id}`} target="_blank" rel="noopener noreferrer">
                {paper.title}
              </a>
            </h3>
            
            <div class="flex items-center gap-2 text-sm text-black/50 dark:text-white/50 mb-4 font-mono">
              <span>{getAuthors(paper.authors)}</span>
              <span>•</span>
              <span>{new Date(paper.publishedAt).getFullYear()}</span>
              {#if error}
                <span class="text-amber-500 text-xs ml-2">({error})</span>
              {/if}
            </div>

            <p class="text-black/70 dark:text-white/70 text-sm leading-relaxed max-w-2xl mb-6">
              {cleanSummary(paper.summary)}
            </p>

            <div class="flex gap-4">
              <a href={`https://huggingface.co/papers/${paper.id}`} target="_blank" rel="noopener noreferrer"
                 class="inline-flex items-center gap-2 text-sm font-bold text-black/70 dark:text-white/70 hover:text-[var(--primary)] transition">
                <span>Read on HF</span>
                <Icon icon="material-symbols:arrow-outward" />
              </a>
              <a href={`https://arxiv.org/pdf/${paper.id}.pdf`} target="_blank" rel="noopener noreferrer"
                 class="inline-flex items-center gap-2 text-sm font-bold text-black/70 dark:text-white/70 hover:text-[var(--primary)] transition">
                <span>PDF</span>
                <Icon icon="material-symbols:picture-as-pdf-outline" />
              </a>
            </div>
          </div>
        {/if}
      </div>

      <!-- Right: ID & Icon -->
      <div class="hidden sm:flex flex-col items-end gap-2 opacity-30">
        <div class="text-6xl font-black text-transparent stroke-text">
            ArXiv
        </div>
        <div class="text-xs font-mono font-bold tracking-widest">
            {paper ? paper.id : 'LOADING'}
        </div>
      </div>

    </div>
  </div>
</div>

<style>
  .stroke-text {
    -webkit-text-stroke: 2px currentColor;
    color: transparent;
  }
</style>
