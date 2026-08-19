import { configure } from '@codegenie/serverless-express';
import { app } from './server.js';

/**
 * Wraps the Express app for Lambda. server.ts skips app.listen() when
 * AWS_LAMBDA_FUNCTION_NAME is set, so importing it here starts no server.
 */
export const handler = configure({ app });
