import { createEnv } from './dist/index.js';

const script = `
print("Hello from PixoScript!")
return 42
`;

const env = createEnv();
const result = env.parse(script).exec();
console.log('Result:', result);
