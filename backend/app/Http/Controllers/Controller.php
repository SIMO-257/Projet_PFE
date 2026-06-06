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
     * Return an Excel download response (.xls) built as an HTML table.
     * Excel opens HTML tables natively — no external library required.
     *
     * @param  \Illuminate\Support\Collection|array  $items
     * @param  array   $headers      Column header labels
     * @param  callable $rowCallback  fn($item) => [col1, col2, ...]
     * @param  string   $filename    Output filename (will get .xls extension)
     * @return \Illuminate\Http\Response
     */
    protected function csvDownload($items, array $headers, callable $rowCallback, string $filename)
    {
        // Prefix: filename may still have .csv — normalise to .xls
        $filename = preg_replace('/\.csv$/i', '.xls', $filename);

        $rows = '';
        $rows .= '<tr>' . implode('', array_map(fn($h) => '<th style="background:#f5d579;color:#1a0507;padding:6px 12px;text-align:left;font-weight:600">' . htmlspecialchars((string) $h) . '</th>', $headers)) . '</tr>' . "\n";

        foreach ($items as $item) {
            $cells = array_map(fn($v) => '<td style="padding:4px 12px;border:1px solid #ccc">' . htmlspecialchars((string) ($v ?? '')) . '</td>', $rowCallback($item));
            $rows .= '<tr>' . implode('', $cells) . '</tr>' . "\n";
        }

        $html = '<!DOCTYPE html>' . "\n"
            . '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' . "\n"
            . '<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Export</x:Name></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>' . "\n"
            . '<body><table>' . "\n"
            . $rows
            . '</table></body></html>' . "\n";

        return response($html, 200, [
            'Content-Type'        => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0',
        ]);
    }
}
