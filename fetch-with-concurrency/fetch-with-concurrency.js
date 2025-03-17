async function fetchWithConcurrency(urls, MAX_CONCURRENCY) {
  const results = new Array(urls.length);
  let currentIndex = 0;

  async function worker() {
      while (currentIndex < urls.length) {
          const index = currentIndex++;
          try {
              results[index] = await fetch(urls[index]);
          } catch (error) {
              results[index] = new Response(null, { status: 500, statusText: 'Fetch failed' });
          }
      }
  }

  const workers = [];
  for (let i = 0; i < Math.min(MAX_CONCURRENCY, urls.length); i++) {
      workers.push(worker());
  }

  await Promise.all(workers);
  return results;
}

module.exports = fetchWithConcurrency;
