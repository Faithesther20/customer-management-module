<?php

// namespace App\Imports;
// use Illuminate\Support\Facades\Auth;
// use App\Models\Customer;
// use Maatwebsite\Excel\Concerns\ToModel;
// use Maatwebsite\Excel\Concerns\WithHeadingRow;

// class CustomersImport implements ToModel, WithHeadingRow
// {
//     public function model(array $row)
//     {
//         // Skip if email or phone exists
//         if (Customer::where('email', $row['email'])->exists() ||
//             Customer::where('phone', $row['phone'])->exists()) {
//             return null;
//         }

//         return new Customer([
//             'name'        => $row['name'],
//             'email'       => $row['email'],
//             'phone'       => $row['phone'],
//             'company_name'=> $row['company_name'],
//             'created_by'  => Auth::id(),
//         ]);
//     }
// }


namespace App\Imports;

use App\Models\Customer;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Log;


class CustomersImport implements ToModel, WithHeadingRow
{
    protected $userId;

    public function __construct($userId)
    {
        $this->userId = $userId;
    }

    public function model(array $row)
    {
        // Map possible header variations to standard fields
        $name         = $row['name'] ?? $row['full_name'] ?? null;
        $email        = $row['email'] ?? $row['email_address'] ?? null;
        $phone        = $row['phone'] ?? $row['phone_number'] ?? null;
        $company_name = $row['company_name'] ?? $row['company'] ?? null;

        // Skip if required fields are missing
        if (!$name || !$email || !$phone || !$company_name) {
            return null;
        }

        // Skip duplicates
        if (Customer::where('email', $email)->exists() ||
            Customer::where('phone', $phone)->exists()) {
            return null;
        }

        return new Customer([
            'name'        => $name,
            'email'       => $email,
            'phone'       => $phone,
            'company_name'=> $company_name,
            'created_by'  => $this->userId,
        ]);
    }
}
