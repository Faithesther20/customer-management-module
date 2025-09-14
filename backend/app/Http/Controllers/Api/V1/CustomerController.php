<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\ModelNotFoundException;

use Maatwebsite\Excel\Facades\Excel;
use App\Imports\CustomersImport;
use App\Exports\CustomersExport;
use Illuminate\Support\Facades\Log;



class CustomerController extends Controller
{
        // List customers
  public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $query = Customer::query();

            // Admin sees all, normal user sees only their own
            if ($user->role !== 'admin') {
                $query->where('created_by', $user->id);
            }

            // Search by name or email
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Filter by company
            if ($request->filled('company')) {
                $query->where('company_name', $request->company);
            }

            // **Sorting to prevent SQL injection**
            $allowedSorts = ['name', 'email', 'company_name', 'created_at'];
            $allowedOrders = ['asc', 'desc'];

            $sortBy = in_array($request->get('sort_by'), $allowedSorts) 
                    ? $request->get('sort_by') 
                    : 'created_at';

            $sortOrder = in_array($request->get('sort_order'), $allowedOrders)
                        ? $request->get('sort_order') 
                        : 'desc';

            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 10);
            $customers = $query->paginate($perPage);

            // Check if paginated results are empty
            if ($customers->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'No customers found',
                    'data' => []
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $customers
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }


    // Create a customer
    // public function store(Request $request)
    // {
    //     try {
    //         $request->validate([
    //             'name' => 'required|string',
    //             'email' => 'required|email|unique:customers',
    //             'phone' => 'required|unique:customers',
    //             'company_name' => 'required|string',
    //         ]);

    //         $customer = Customer::create([
    //             'name' => $request->name,
    //             'email' => $request->email,
    //             'phone' => $request->phone,
    //             'company_name' => $request->company_name,
    //             'created_by' => Auth::id(),
    //         ]);

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Customer created successfully',
    //             'data' => $customer
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function store(Request $request)
{
    try {

        \Log::info('Authenticated user', ['id' => Auth::id(), 'role' => Auth::user()->role]);

        $user = Auth::user();

        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:customers,email',
            'phone' => 'required|unique:customers,phone',
            'company_name' => 'required|string',
        ]);

        $customer = Customer::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'company_name' => $request->company_name,
            'created_by' => $user->id, // <- ensure this is not null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Customer created successfully',
            'data' => $customer
        ]);
    } catch (\Exception $e) {
        // better error logging
        \Log::error('Customer store failed: '.$e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Failed to create customer',
            'error' => $e->getMessage()
        ], 500);
    }
}


    // Show single customer
    public function show($id)
    {
        try {
            $customer = Customer::findOrFail($id);
            $user = Auth::user();

            if ($user->role !== 'admin' && $customer->created_by !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            return response()->json(['success' => true, 'data' => $customer]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Customer not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Update customer
    public function update(Request $request, $id)
    {
        try {
            $customer = Customer::findOrFail($id);
            $user = Auth::user();

            if ($user->role !== 'admin' && $customer->created_by !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $request->validate([
                'name' => 'sometimes|required|string',
                'email' => 'sometimes|required|email|unique:customers,email,'.$customer->id,
                'phone' => 'sometimes|required|unique:customers,phone,'.$customer->id,
                'company_name' => 'sometimes|required|string',
            ]);

            $customer->update($request->only(['name', 'email', 'phone', 'company_name']));

            return response()->json(['success' => true, 'message' => 'Customer updated', 'data' => $customer]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Customer not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Delete customer
    public function destroy($id)
    {
        try {
            $customer = Customer::findOrFail($id);
            $user = Auth::user();

            if ($user->role !== 'admin' && $customer->created_by !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $customer->delete();

            return response()->json(['success' => true, 'message' => 'Customer deleted']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Customer not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

  

    //******** CODES  ON IMPORTS */

    // Import customers from  Excel or CSV
    //     public function import(Request $request)
    // {
    //     try {
    //         $request->validate([
    //             'file' => 'required|file|mimes:csv,xlsx'
    //         ]);

    //         Excel::import(new CustomersImport, $request->file('file'));

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Customers imported successfully'
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => $e->getMessage()
    //         ], 500);
    //     }
    // }

   public function import(Request $request)
{
    try {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx'
        ]);

        $userId = Auth::id(); // get the current logged-in user
        $file = $request->file('file');

        Excel::import(new CustomersImport($userId), $request->file('file'));

            // Delete the uploaded temp file to avoid conflicts
        if (file_exists($file->getPathname())) {
            unlink($file->getPathname());
        }

        return response()->json([
            'success' => true,
            'message' => 'Customers imported successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ], 500);
    }
}   

    // Export customers to Excel or CSV
    public function export(Request $request)
    {
        $user = $request->user();
        $format = $request->query('format', 'csv'); // default CSV

        // Role-based export
        if ($user->role === 'admin') {
            $customers = Customer::all();
        } else {
            $customers = Customer::where('created_by', $user->id)->get();
        }

        if ($customers->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No customers found for export'
            ], 404);
        }

        $export = new CustomersExport($customers);

        // Decide format
        if ($format === 'xlsx') {
            return Excel::download($export, 'customers_export.xlsx', \Maatwebsite\Excel\Excel::XLSX);
        } else {
            return Excel::download($export, 'customers_export.csv', \Maatwebsite\Excel\Excel::CSV);
        }
    }


    //** CODES for Dashboar sumamay */ 
    public function summary()
    {
        try {
            $totalCustomers = Customer::count();

            $customersToday = Customer::whereDate('created_at', now()->toDateString())->count();

            $topCompanies = Customer::select('company_name')
                ->selectRaw('COUNT(*) as total')
                ->groupBy('company_name')
                ->orderByDesc('total')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_customers' => $totalCustomers,
                    'customers_today' => $customersToday,
                    'top_companies'   => $topCompanies
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch summary',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

  



}
