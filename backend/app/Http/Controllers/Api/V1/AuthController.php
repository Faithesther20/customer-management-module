<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Register a new user
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'role'     => 'nullable|in:user', // prevent creating admin directly
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role ?? 'user',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'data'    => [
                'token' => $user->createToken('api_token')->plainTextToken,
                'user'  => $user,
            ],
        ], 201); // 201 Created
    }

    // Login existing user
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data'    => [
                'token' => $user->createToken('api_token')->plainTextToken,
                'user'  => $user,
            ],
        ], 200);
    }

    // Logout user (current device)
    public function logout(Request $request)
    {
        // Delete current access token only for per-device logout
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ], 200);
    }
}
