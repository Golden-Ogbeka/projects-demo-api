import { Router } from "express";

export type ProjectModule = {
  name: string;
  basePath: string;
  router: Router;
  setupDatabase: () => void;
};
