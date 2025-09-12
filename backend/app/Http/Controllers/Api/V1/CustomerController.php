<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\ModelNotFoundException;

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
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string',
                'email' => 'required|email|unique:customers',
                'phone' => 'required|unique:customers',
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
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
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
}
