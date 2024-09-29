import { faker } from '@faker-js/faker';
export const generateFakeUsername = (name: string) => {
    const username = faker.internet.userName({
        firstName: name,
    });
    return username.toLowerCase();
}
