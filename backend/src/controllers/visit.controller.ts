import type { Request, Response } from "express";
import ExcelJS from "exceljs";
import asyncHandler from "../utils/asyncHandler.js";
import { createVisitSchema, visitHistoryQuerySchema } from "../types/visit.types.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as visitService from "../service/visit.service.js";

export const addVisit = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createVisitSchema.parse(req.body);

  const newVisit = await visitService.createVisit(validatedData);

  return res
    .status(201)
    .json(new ApiResponse("Visit created successfully", newVisit, true));
});

export const getVisitHistory = asyncHandler(async (req: Request, res: Response) => {
    const query = visitHistoryQuerySchema.parse(req.query);
    
    const { visits, summary } = await visitService.getVisitHistory(query);

    return res.status(200).json(
        new ApiResponse("Visit history retrieved successfully", { visits, summary }, true)
    );
});

export const exportVisitHistoryExcel = asyncHandler(async (req: Request, res: Response) => {
    const query = visitHistoryQuerySchema.parse(req.query);
    const { visits } = await visitService.getVisitHistory(query);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Visit History");

    // Define columns
    worksheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Visit Type", key: "visitType", width: 15 },
        { header: "Patient Name", key: "patientName", width: 25 },
        { header: "Patient Phone", key: "patientPhone", width: 18 },
        { header: "Doctor Name", key: "doctorName", width: 25 },
        { header: "Specialization", key: "specialization", width: 20 },
        { header: "Status", key: "status", width: 15 },
        { header: "Timestamp", key: "timestamp", width: 22 },
        { header: "Priority", key: "priority", width: 12 },
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { color: { argb: "FFFFFFFF" }, bold: true, size: 12 };
    headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2563EB" }, // Blue background
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };


    visits.forEach((visit: { logs: any[]; createdAt: string | number | Date; visitType: any; patient: { name: any; phone: any; }; doctor: { user: { name: any; }; specialisation: any; }; priority: any; }) => {
        const startRow = worksheet.rowCount + 1;

        visit.logs.forEach((log, index) => {
            worksheet.addRow({
                // Visit-level data is only added once per visit block
                date: index === 0 ? new Date(visit.createdAt) : undefined,
                visitType: index === 0 ? visit.visitType : undefined,
                patientName: index === 0 ? visit.patient?.name : undefined,
                patientPhone: index === 0 ? visit.patient?.phone : undefined,
                doctorName: index === 0 ? visit.doctor?.user?.name : undefined,
                specialization: index === 0 ? visit.doctor?.specialisation : undefined,
                priority: index === 0 ? visit.priority : undefined,

                // Log-specific data is added for every log entry
                status: log.status,
                timestamp: new Date(log.timestamp),
                notes: log.notes || "",
            });
        });

        const endRow = worksheet.rowCount;

        // If a visit has more than one log, merge the visit-level cells
        if (visit.logs.length > 1) {
            worksheet.mergeCells(`A${startRow}:A${endRow}`);
            worksheet.mergeCells(`B${startRow}:B${endRow}`);
            worksheet.mergeCells(`C${startRow}:C${endRow}`);
            worksheet.mergeCells(`D${startRow}:D${endRow}`);
            worksheet.mergeCells(`E${startRow}:E${endRow}`);
            worksheet.mergeCells(`F${startRow}:F${endRow}`);
            worksheet.mergeCells(`I${startRow}:I${endRow}`);
        }
    });
    
    // Style all data rows
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                // Set vertical alignment to middle for all cells
                cell.alignment = { vertical: 'middle' };
                // Add borders
                cell.border = {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                };
                
                // Format date and time cells
                if (colNumber === 1 || colNumber === 8) { // Date and Timestamp columns
                    cell.numFmt = 'yyyy-mm-dd hh:mm AM/PM';
                }
            });
        }
    });
    
    // --- END OF THE IMPROVED LOGIC ---

    // Auto-filter, filename, and response headers remain the same
    worksheet.autoFilter = { from: "A1", to: "J1" };
    const filename = `visit-history-${query.date || 'export'}.xlsx`;
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    
    await workbook.xlsx.write(res);
    res.end();
});

export const getPatientVisitHistory = asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params;
    
    const visits = await visitService.getPatientCompleteHistory(patientId!);

    return res.status(200).json(
        new ApiResponse(
            "Patient visit history retrieved successfully",
            { visits },
            true
        )
    );
});

export const getDoctorVisitHistory = asyncHandler(async (req: Request, res: Response) => {
    const { doctorId } = req.params;
    
    const visits = await visitService.getDoctorCompleteHistory(doctorId!);

    return res.status(200).json(
        new ApiResponse(
            "Doctor visit history retrieved successfully",
            { visits },
            true
        )
    );
});