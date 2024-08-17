/** Returns NaN if not enough data is provided. */
export default function calculatePercentile(data: number[], percentile: number): number {
    // Step 1: Sort the data
    const sortedData: number[] = [...data].sort((a, b) => a - b);

    // Step 2: Calculate the rank
    const rank: number = (percentile / 100) * (sortedData.length + 1);

    // Step 3: Interpolate if needed
    let percentileValue: number;
    if (rank % 1 === 0) {
        percentileValue = sortedData[rank - 1];
    } else {
        const lowerIndex: number = Math.floor(rank) - 1;
        const upperIndex: number = Math.ceil(rank) - 1;
        const lowerValue: number = sortedData[lowerIndex];
        const upperValue: number = sortedData[upperIndex];
        percentileValue = lowerValue + (upperValue - lowerValue) * (rank - Math.floor(rank));
    }

    return percentileValue;
}
// chatgpt lol