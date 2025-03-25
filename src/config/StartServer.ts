import { Application } from 'express';
import {env} from "./env"

export const startServer = (app: Application, port: number) => {
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${port}`);
  });
};