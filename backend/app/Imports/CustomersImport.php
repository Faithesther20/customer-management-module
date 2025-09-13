<?php

namespace App\Imports;
use Illuminate\Support\Facades\Auth;
use App\Models\Customer;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class CustomersImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Skip if email or phone exists
        if (Customer::where('email', $row['email'])->exists() ||
            Customer::where('phone', $row['phone'])->exists()) {
            return null;
        }

        return new Customer([
            'name'        => $row['name'],
            'email'       => $row['email'],
            'phone'       => $row['phone'],
            'company_name'=> $row['company_name'],
            'created_by'  => Auth::id(),
        ]);
    }
}