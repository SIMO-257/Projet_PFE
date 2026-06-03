<?php

namespace App\Http\Controllers;

abstract class Controller
{
    protected function successResponse($data = null, $message = 'Success', $code = 200)
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ], $code);
    }

    protected function errorResponse($message = 'Error', $code = 400, $data = null)
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
            'data' => $data
        ], $code);
    }

    /**
     * Return a CSV download response using a simple string body.
     * Compatible with PHP-FPM + nginx.
     */
    protected function csvDownload($items, array $headers, callable $rowCallback, string $filename)
    {
        // Build CSV as a string in memory
        $csv = chr(0xEF) . chr(0xBB) . chr(0xBF); // UTF-8 BOM
        $csv .= $this->csvRow($headers);

        foreach ($items as $item) {
            $csv .= $this->csvRow($rowCallback($item));
        }

        return response($csv, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0',
        ]);
    }

    /**
     * Encode an array as a CSV line.
     */
    private function csvRow(array $fields): string
    {
        $escaped = array_map(function ($val) {
            $val = (string) ($val ?? '');
            // If contains comma, double-quote, or newline, wrap in double-quotes
            if (strpbrk($val, '",' . "\n\r") !== false) {
                $val = '"' . str_replace('"', '""', $val) . '"';
            }
            return $val;
        }, $fields);

        return implode(',', $escaped) . "\r\n";
    }
}
