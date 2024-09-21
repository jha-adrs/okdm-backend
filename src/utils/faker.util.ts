import { faker } from '@faker-js/faker';
export const generateFakeUsername = (name: string) => {
    return faker.internet.userName({
        firstName: name,
    });
}
