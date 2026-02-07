/**
 * Utility to wrap a promise (or promise-like object) with a timeout.
 * @param promise The promise or thenable to wrap
 * @param description Description of the operation for error logging
 * @param timeoutMs Timeout in milliseconds (default 10000ms)
 */
export async function withTimeout<T>(
    promise: Promise<T> | PromiseLike<T>,
    description: string,
    timeoutMs: number = 10000
): Promise<T> {
    // Convert PromiseLike to a real Promise if needed
    const actualPromise = Promise.resolve(promise);

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            console.error(`[Timeout] ${description} timed out after ${timeoutMs}ms`);
            reject(new Error(`${description} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });

    try {
        const result = await Promise.race([actualPromise, timeoutPromise]);
        if (timeoutId) clearTimeout(timeoutId);
        return result as T;
    } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        throw error;
    }
}
