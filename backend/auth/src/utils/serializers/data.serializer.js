/**
 * Serializes data containing BigInt values to JSON-safe format
 * @param {*} data - The data to serialize
 * @returns {*} - Serialized data with BigInt converted to strings
 */
export const serializeBigInt = (data) => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value
    ));
};

/**
 * Additional serializers can be added here as needed
 */ 