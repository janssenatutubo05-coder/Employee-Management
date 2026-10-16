<?php

namespace App\Actions\Fortify;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    /**
     * Validate and create a newly registered user.
     * Every self-registered account gets the "Employee" role and an employee record.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
        ])->validate();

        return DB::transaction(function () use ($input) {
            $user = User::create([
                'name' => $input['first_name'].' '.$input['last_name'],
                'email' => $input['email'],
                'password' => $input['password'],
            ]);

            $user->assignRole('Employee');

            // Link to a pre-created employee record (same email) if the admin added one first.
            $employee = Employee::whereNull('user_id')->where('email', $input['email'])->first();

            if ($employee) {
                $employee->update(['user_id' => $user->id]);
            } else {
                Employee::create([
                    'first_name' => $input['first_name'],
                    'last_name' => $input['last_name'],
                    'email' => $input['email'],
                    'position' => 'Staff',
                    'status' => 'Active',
                    'user_id' => $user->id,
                ]);
            }

            return $user;
        });
    }
}
