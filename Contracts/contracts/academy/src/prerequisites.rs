//! Minimal prerequisite registry for academy courses.
//!
//! A course may require that one or more other courses have been completed
//! before a learner can enrol. The registry only stores that mapping; callers
//! decide what "completed" means for their course.

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol, Vec};

const ADMIN: Symbol = symbol_short!("admin");

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CoursePrerequisites {
    pub course_id: Symbol,
    pub required: Vec<Symbol>,
}

#[contract]
pub struct AcademyPrerequisitesContract;

#[contractimpl]
impl AcademyPrerequisitesContract {
    /// Set the admin allowed to write prerequisite rules.
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&ADMIN, &admin);
    }

    /// Record the courses that must be completed before `course_id`.
    pub fn set_prerequisites(env: Env, admin: Address, course_id: Symbol, required: Vec<Symbol>) {
        admin.require_auth();

        let stored: Address = env
            .storage()
            .instance()
            .get(&ADMIN)
            .unwrap_or_else(|| panic!("not initialized"));
        if admin != stored {
            panic!("unauthorized");
        }

        env.storage()
            .persistent()
            .set(&(symbol_short!("prereq"), course_id), &required);
    }

    /// Return the prerequisites recorded for a course.
    pub fn get_prerequisites(env: Env, course_id: Symbol) -> CoursePrerequisites {
        let required: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&(symbol_short!("prereq"), course_id.clone()))
            .unwrap_or(Vec::new(&env));

        CoursePrerequisites { course_id, required }
    }

    /// Whether `completed` satisfies every prerequisite of `course_id`.
    pub fn meets_prerequisites(env: Env, course_id: Symbol, completed: Vec<Symbol>) -> bool {
        let required: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&(symbol_short!("prereq"), course_id))
            .unwrap_or(Vec::new(&env));

        for prerequisite in required.iter() {
            if !completed.iter().any(|done| done == prerequisite) {
                return false;
            }
        }
        true
    }
}
