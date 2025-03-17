const fetchWithConcurrency = require('./fetch-with-concurrency');
global.fetch = jest.fn();

// Mock the Response class
global.Response = class {
    constructor(body, { status = 200, statusText = 'OK' } = {}) {
        this.body = body;
        this.status = status;
        this.statusText = statusText;
    }

    async text() {
        return this.body;
    }
};

describe('fetchWithConcurrency', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('fetches all URLs successfully', async () => {
        fetch.mockImplementation((url) => 
            Promise.resolve(new Response(`Response from ${url}`))
        );

        const urls = [
            'https://api.sample.com/test1', 
            'https://api.sample.com/test2', 
            'https://api.sample.com/test3', 
            'https://api.sample.com/test4'
        ];

        const responses = await fetchWithConcurrency(urls, 2);

        expect(fetch).toHaveBeenCalledTimes(urls.length);
        expect(responses.length).toBe(urls.length);

        for (let i = 0; i < urls.length; i++) {
            await expect(responses[i].text()).resolves.toBe(`Response from ${urls[i]}`);
        }
    });

    test('does not exceed MAX_CONCURRENCY', async () => {
        let activeRequests = 0;
        let maxObservedRequests = 0;

        fetch.mockImplementation(async () => {
            activeRequests++;
            maxObservedRequests = Math.max(maxObservedRequests, activeRequests);
            await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate a delay
            activeRequests--;
            return new Response('OK');
        });

        const urls = new Array(10).fill('https://jsonplaceholder.typicode.com/todos/1');
        const MAX_CONCURRENCY = 3;
        await fetchWithConcurrency(urls, MAX_CONCURRENCY);

        expect(maxObservedRequests).toBeLessThanOrEqual(MAX_CONCURRENCY);
    });

    test('handles failures correctly', async () => {
        fetch.mockImplementation((url) => {
            if (url.includes('fail')) {
                return Promise.resolve(new Response('Network error', { status: 500 }));
            }
            return Promise.resolve(new Response('OK'));
        });

        const urls = ['https://api.sample.com/fail', 'https://api.sample.com/fail'];
        const responses = await fetchWithConcurrency(urls, 2);

        expect(fetch).toHaveBeenCalledTimes(urls.length);
        expect(responses[0].status).toBe(500);
        expect(responses[1].status).toBe(500);
    });

    test('handles empty URLs array', async () => {
        const urls = [];
        const responses = await fetchWithConcurrency(urls, 2);

        expect(responses).toEqual([]);
    });
});
