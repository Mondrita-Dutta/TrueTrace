#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_register_and_get() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TrueTraceContract);
    let client = TrueTraceContractClient::new(&env, &contract_id);

    let manufacturer = Address::generate(&env);
    let product_id = String::from_str(&env, "TT-2026-000001");
    let hash = String::from_str(&env, "dummyhash123");

    env.mock_all_auths();

    client.register_product(&product_id, &manufacturer, &hash);

    let product = client.get_product(&product_id);
    assert_eq!(product.id, product_id);
    assert_eq!(product.manufacturer, manufacturer);
    assert_eq!(product.owner, manufacturer);
    assert_eq!(product.hash, hash);
    assert_eq!(product.status, ProductStatus::Verified);
    assert_eq!(product.counterfeit_reports, 0);
}

#[test]
fn test_transfer_ownership() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TrueTraceContract);
    let client = TrueTraceContractClient::new(&env, &contract_id);

    let mfg = Address::generate(&env);
    let new_owner = Address::generate(&env);
    let product_id = String::from_str(&env, "TT-002");
    let hash = String::from_str(&env, "hash2");

    env.mock_all_auths();
    client.register_product(&product_id, &mfg, &hash);
    client.transfer_ownership(&product_id, &mfg, &new_owner);

    let product = client.get_product(&product_id);
    assert_eq!(product.owner, new_owner);
}

#[test]
fn test_report_counterfeit() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TrueTraceContract);
    let client = TrueTraceContractClient::new(&env, &contract_id);

    let mfg = Address::generate(&env);
    let reporter = Address::generate(&env);
    let product_id = String::from_str(&env, "TT-003");
    let hash = String::from_str(&env, "hash3");

    env.mock_all_auths();
    client.register_product(&product_id, &mfg, &hash);
    client.report_counterfeit(&product_id, &reporter);

    let product = client.get_product(&product_id);
    assert_eq!(product.status, ProductStatus::Reported);
    assert_eq!(product.counterfeit_reports, 1);
}
