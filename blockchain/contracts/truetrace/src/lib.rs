#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ProductStatus {
    Verified,
    Reported,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Product {
    pub id: String,
    pub manufacturer: Address,
    pub owner: Address,
    pub hash: String,
    pub status: ProductStatus,
    pub counterfeit_reports: u32,
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Product(String),
    MetricsContract,
}

#[contract]
pub struct TrueTraceContract;

#[contractimpl]
impl TrueTraceContract {
    /// Initializes the contract with the address of the metrics contract
    pub fn init(env: Env, metrics_contract: Address) {
        if env.storage().instance().has(&DataKey::MetricsContract) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::MetricsContract, &metrics_contract);
    }

    /// Registers a new product on the blockchain.
    pub fn register_product(env: Env, id: String, manufacturer: Address, hash: String) {
        manufacturer.require_auth();

        let key = DataKey::Product(id.clone());
        if env.storage().persistent().has(&key) {
            panic!("Product already registered");
        }

        let product = Product {
            id: id.clone(),
            manufacturer: manufacturer.clone(),
            owner: manufacturer.clone(),
            hash: hash.clone(),
            status: ProductStatus::Verified,
            counterfeit_reports: 0,
            timestamp: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&key, &product);

        // Call metrics contract if initialized
        if let Some(metrics_contract) = env.storage().instance().get::<_, Address>(&DataKey::MetricsContract) {
            env.invoke_contract::<u32>(&metrics_contract, &symbol_short!("increment"), soroban_sdk::vec![&env]);
        }

        // Emit event
        env.events().publish((symbol_short!("register"), id), product);
    }

    /// Retrieves a product by ID.
    pub fn get_product(env: Env, id: String) -> Product {
        let key = DataKey::Product(id);
        env.storage().persistent().get(&key).expect("Product not found")
    }

    /// Updates product hash
    pub fn update_product(env: Env, id: String, owner: Address, new_hash: String) {
        owner.require_auth();

        let key = DataKey::Product(id.clone());
        let mut product: Product = env.storage().persistent().get(&key).expect("Product not found");

        if product.owner != owner {
            panic!("Only owner can update product");
        }

        product.hash = new_hash;
        product.timestamp = env.ledger().timestamp();

        env.storage().persistent().set(&key, &product);

        // Emit event
        env.events().publish((symbol_short!("update"), id), product);
    }

    /// Transfers ownership of the product.
    pub fn transfer_ownership(env: Env, id: String, current_owner: Address, new_owner: Address) {
        current_owner.require_auth();

        let key = DataKey::Product(id.clone());
        let mut product: Product = env.storage().persistent().get(&key).expect("Product not found");

        if product.owner != current_owner {
            panic!("Only current owner can transfer ownership");
        }

        product.owner = new_owner.clone();
        product.timestamp = env.ledger().timestamp();

        env.storage().persistent().set(&key, &product);

        // Emit event
        env.events().publish((symbol_short!("transfer"), id), product);
    }

    /// Reports a product as counterfeit.
    pub fn report_counterfeit(env: Env, id: String, reporter: Address) {
        reporter.require_auth();

        let key = DataKey::Product(id.clone());
        let mut product: Product = env.storage().persistent().get(&key).expect("Product not found");

        product.counterfeit_reports += 1;
        product.status = ProductStatus::Reported;
        product.timestamp = env.ledger().timestamp();

        env.storage().persistent().set(&key, &product);

        // Emit event
        env.events().publish((symbol_short!("report"), id), product);
    }
}

mod test;
