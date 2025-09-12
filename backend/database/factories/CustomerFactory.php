<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

class CustomerFactory extends Factory
{
    protected $model = \App\Models\Customer::class;

    public function definition()
    {
        // Pick a random user ID from the users table to be 'created_by'
        $userIds = User::pluck('id')->toArray();
        $createdBy = $this->faker->randomElement($userIds);

        return [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->unique()->phoneNumber,
            'company_name' => $this->faker->company,
            'created_by' => $createdBy,
        ];
    }
}
