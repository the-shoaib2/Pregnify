/**
 * Generate a unique username based on the user's first and last name.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @returns {string} - The generated username in the format: firstName@lastNameXXXX
 * Where XXXX is a 4-digit random number.
 */
export const generateUsername = (firstName, lastName) => {
    // Sanitize inputs by converting to lowercase
    const sanitizedFirstName = firstName.toLowerCase();
    const sanitizedLastName = lastName.toLowerCase();

    // Generate a random 4-digit number
    const generateRandomNumber = () => {
        return Math.floor(1000 + Math.random() * 9000); // Generates a number between 1000 and 9999
    };

    // Combine to create the username
    // example @xyz.abc1234
    const username = `${sanitizedFirstName}.${sanitizedLastName}${generateRandomNumber()}`;


    return username;
};
