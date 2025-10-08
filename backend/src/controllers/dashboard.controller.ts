import type { Request, Response } from 'express';
import * as dashboardService from '../service/dashboard.service.js';

export const getDashboardMetrics = async (req: Request, res: Response) => {
    try {
        const data = await dashboardService.getDashboardData();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
};