<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
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

            if ($user->role !== 'admin') {
                $query->where('created_by', $user->id);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($request->filled('company')) {
                $query->where('company_name', $request->company);
            }

            $allowedSorts = ['name', 'email', 'company_name', 'created_at'];
            $allowedOrders = ['asc', 'desc'];

            $sortBy = in_array($request->get('sort_by'), $allowedSorts) 
                      ? $request->get('sort_by') 
                      : 'created_at';

            $sortOrder = in_array($request->get('sort_order'), $allowedOrders)
                         ? $request->get('sort_order') 
                         : 'desc';

            $query->orderBy($sortBy, $sortOrder);

            $perPage = $request->get('per_page', 10);
            $customers = $query->paginate($perPage);

            if ($customers->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'No customers found',
                    'data' => []
                ], 200);
            }

            return response()->json([
                'success' => true,
                'message' => 'Customers retrieved successfully',
                'data' => $customers
            ]);

        } catch (\Exception $e) {
            Log::error('Customer index failed: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve customers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Create customer
    public function store(Request $request)
    {
        try {
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
                'created_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Customer created successfully',
                'data' => $customer
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Customer store failed: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Show customer
    public function show($id)
    {
        try {
            $customer = Customer::findOrFail($id);
            $user = Auth::user();

            if ($user->role !== 'admin' && $customer->created_by !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            return response()->json([
                'success' => true,
                'message' => 'Customer retrieved successfully',
                'data' => $customer
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Customer not found'], 404);
        } catch (\Exception $e) {
            Log::error('Customer show failed: '.$e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to retrieve customer', 'error' => $e->getMessage()], 500);
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

            return response()->json([
                'success' => true,
                'message' => 'Customer updated successfully',
                'data' => $customer
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Customer not found'], 404);
        } catch (\Exception $e) {
            Log::error('Customer update failed: '.$e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update customer', 'error' => $e->getMessage()], 500);
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

            return response()->json([
                'success' => true,
                'message' => 'Customer deleted successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Customer not found'], 404);
        } catch (\Exception $e) {
            Log::error('Customer delete failed: '.$e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to delete customer', 'error' => $e->getMessage()], 500);
        }
    }

    // Import customers
    public function import(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file|mimes:csv,xlsx'
            ]);

            $userId = Auth::id();
            $file = $request->file('file');

            Excel::import(new CustomersImport($userId), $file);

            // Remove temp file
            if (file_exists($file->getPathname())) {
                unlink($file->getPathname());
            }

            return response()->json([
                'success' => true,
                'message' => 'Customers imported successfully'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Customer import failed: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to import customers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Export customers
    public function export(Request $request)
    {
        try {
            $user = Auth::user();
            $format = $request->query('format', 'csv');

            $customers = $user->role === 'admin'
                         ? Customer::all()
                         : Customer::where('created_by', $user->id)->get();

            if ($customers->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No customers found for export'
                ], 404);
            }

            $export = new CustomersExport($customers);

            if ($format === 'xlsx') {
                return Excel::download($export, 'customers_export.xlsx', \Maatwebsite\Excel\Excel::XLSX);
            } else {
                return Excel::download($export, 'customers_export.csv', \Maatwebsite\Excel\Excel::CSV);
            }

        } catch (\Exception $e) {
            Log::error('Customer export failed: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to export customers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Dashboard summary
 public function summary()
{
    try {
        $user = Auth::user();

        // Base query depending on role
        $query = $user->role === 'admin' 
                 ? Customer::query() 
                 : Customer::where('created_by', $user->id);

        $totalCustomers = $query->count();
        $customersToday = $query->whereDate('created_at', now()->toDateString())->count();

        // Top companies
        $topCompanies = $query->select('company_name')
                              ->selectRaw('COUNT(*) as total')
                              ->groupBy('company_name')
                              ->orderByDesc('total')
                              ->limit(5)
                              ->get();

        return response()->json([
            'success' => true,
            'message' => 'Summary retrieved successfully',
            'data' => [
                'total_customers' => $totalCustomers,
                'customers_today' => $customersToday,
                'top_companies'   => $topCompanies
            ]
        ]);

    } catch (\Exception $e) {
        Log::error('Summary fetch failed: '.$e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch summary',
            'error' => $e->getMessage()
        ], 500);
    }
}

}
