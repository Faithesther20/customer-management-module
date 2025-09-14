<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class CustomersExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $customers;

    public function __construct($customers)
    {
        $this->customers = $customers;
    }

    // Map each customer row for export
    public function map($customer): array
    {
        return [
            $customer->name ?? '',
            $customer->email ?? '',
            $customer->phone ?? '',
            $customer->company_name ?? '',
            $customer->user?->name ?? 'N/A',
            $customer->created_at?->format('Y-m-d H:i:s') ?? '',
        ];
    }

    // Add headings for the exported file
    public function headings(): array
    {
        return [
            'Name',
            'Email',
            'Phone',
            'Company',
            'Created By',
            'Created At',
        ];
    }

    // Provide the collection to export
    public function collection()
    {
        return $this->customers;
    }
}
