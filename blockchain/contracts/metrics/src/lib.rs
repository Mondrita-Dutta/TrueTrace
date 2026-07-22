#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

#[contract]
pub struct MetricsContract;

const COUNT: Symbol = symbol_short!("COUNT");

#[contractimpl]
impl MetricsContract {
    /// Increments the total product counter and returns the new count
    pub fn increment(env: Env) -> u32 {
        let mut count: u32 = env.storage().persistent().get(&COUNT).unwrap_or(0);
        count += 1;
        env.storage().persistent().set(&COUNT, &count);
        
        // Emit an event for analytics
        env.events().publish((symbol_short!("metrics"), symbol_short!("increment")), count);
        
        count
    }

    /// Gets the current total count
    pub fn get_count(env: Env) -> u32 {
        env.storage().persistent().get(&COUNT).unwrap_or(0)
    }
}
