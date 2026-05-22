import { Request, Response } from "express";
import { sendSuccessFeedback } from "../../../functions/feedback.js";

type GraphqlRequestBody = {
  operationName: string;
  query: string;
  variables: Record<string, unknown>;
};

export const InventoryAdminWebController = () => {
  const GetStatus = async (_req: Request, res: Response) => {
    return sendSuccessFeedback(res, "Inventory Admin Web is ready");
  };

  const HandleGraphql = async (
    req: Request & { body: GraphqlRequestBody },
    res: Response,
  ) => {
    const { operationName, query, variables } = req.body;
    console.log("[inventory-admin-web] GraphQL:", operationName || "Anonymous Query");
    
    // Parse root fields natively without a full AST parser for mock purposes
    const rootFieldsMatch = query.match(/{\s*([\w]+)/g);
    const rootFields = rootFieldsMatch ? rootFieldsMatch.map((m: string) => m.replace(/{\s*/, "")) : [];
    
    const data: any = {};
    for (const field of rootFields) {
      if (field === "query" || field === "mutation") continue;
      
      // Default fallback
      data[field] = {
        nodes: [],
        pageInfo: { currentPage: 1, size: 10, totalCount: 0, hasNextPage: false }
      };
    }

    return res.json({ data });
  };

  return {
    GetStatus,
    HandleGraphql
  };
};
