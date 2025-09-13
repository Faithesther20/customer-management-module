<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class CustomersExport implements FromCollection, WithHeadings
{
    protected $customers;

    public function __construct($customers)
    {
        $this->customers = $customers;
    }

    public function collection()
    {
        // Select only needed columns
        return $this->customers->map(function ($customer) {
            return [
                'name'       => $customer->name,
                'email'      => $customer->email,
                'phone'      => $customer->phone,
                'company'    => $customer->company_name,
                'created_by' => $customer->user ? $customer->user->name : 'N/A',
                'created_at' => $customer->created_at->toDateTimeString(),
            ];
        });
    }

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
}
