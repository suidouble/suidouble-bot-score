
module suidouble_score::suidouble_score {
    use sui::tx_context::{Self, sender, TxContext};
    use std::string::{utf8};

    use sui::object::{Self, UID, ID};
    use std::vector::{Self};

    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::pay;
    use sui::transfer;

    use sui::event::emit;
    
    // The creator bundle: these two packages often go together.
    use sui::package;
    use sui::display;

    const DEFAULT_FEE: u64 = 200_000_000;

    const ENotMaintainer: u64 = 1;
    const ENoBalance: u64 = 2;

    // ======== Events =========
    struct NewSuiScoreEvent has copy, drop {
        sui_score_id: ID,
        for: address,
        score: u64,
    }


    /// One-Time-Witness for the module.
    struct SUIDOUBLE_SCORE has drop {}

    struct SuiScore has key, store {
        id: UID,
        for: address,
        score: u64,
        metadata: vector<u8>,
    }

    struct SuiScoreMaintainer has key {
        id: UID,
        maintainer_address: address,
        score_count: u64,
        fee: u64,
        balance: Balance<SUI>
    }

    /// In the module initializer we claim the `Publisher` object
    /// to then create a `Display`. The `Display` is initialized with
    /// a set of fields (but can be modified later) and published via
    /// the `update_version` call.
    ///
    /// Keys and values are set in the initializer but could also be
    /// set after publishing if a `Publisher` object was created.
    fun init(otw: SUIDOUBLE_SCORE, ctx: &mut TxContext) {
        let keys = vector[
            utf8(b"name"),
            utf8(b"link"),
            utf8(b"image_url"),
            utf8(b"description"),
            utf8(b"project_url"),
            utf8(b"creator"),
        ];

        let values = vector[
            utf8(b"Sui Human Score"),
            // For `link` we can build a URL using an `id` property
            utf8(b"https://sui-bot-score-04f61376a410.herokuapp.com/score/{id}"),
            utf8(b"https://suidouble.github.io/scores/{score}.png"),
            utf8(b"I am {score}% human"),
            // Project URL is usually static
            utf8(b"https://sui-bot-score-04f61376a410.herokuapp.com/"),
            // Creator field can be any
            utf8(b"Suidouble")
        ];

        // Claim the `Publisher` for the package!
        let publisher = package::claim(otw, ctx);

        // Get a new `Display` object for the `Color` type.
        let display = display::new_with_fields<SuiScore>(
            &publisher, keys, values, ctx
        );

        // Commit first version of `Display` to apply changes.
        display::update_version(&mut display);

        transfer::public_transfer(publisher, sender(ctx));
        transfer::public_transfer(display, sender(ctx));

        let maintainer = SuiScoreMaintainer {
            id: object::new(ctx),
            maintainer_address: sender(ctx),
            score_count: 0,
            fee: DEFAULT_FEE,
            balance: balance::zero<SUI>()
        };

        transfer::share_object(maintainer);
    }

    // PUBLIC ENTRY FUNCTIONS //
    
    public entry fun mint(maintainer: &mut SuiScoreMaintainer, fee: vector<Coin<SUI>>, score: u64, for: address, metadata: vector<u8>, ctx: &mut TxContext) {
        let (paid, remainder) = merge_and_split(fee, maintainer.fee, ctx);

        coin::put(&mut maintainer.balance, paid);
        transfer::public_transfer(remainder, tx_context::sender(ctx));

        let id = object::new(ctx);
        let sui_score = SuiScore { id, score, metadata, for  };
        
        emit(NewSuiScoreEvent {
            sui_score_id: object::uid_to_inner(&sui_score.id),
            for,
            score,
        });

        maintainer.score_count = maintainer.score_count + 1;

        transfer::transfer(sui_score, for);
    }

    fun merge_and_split(
        coins: vector<Coin<SUI>>, amount: u64, ctx: &mut TxContext
    ): (Coin<SUI>, Coin<SUI>) {
        let base = vector::pop_back(&mut coins);
        pay::join_vec(&mut base, coins);
        let coin_value = coin::value(&base);
        assert!(coin_value >= amount, coin_value);
        (coin::split(&mut base, amount, ctx), base)
    }

    public fun id(suiScore: &SuiScore): ID {
        object::uid_to_inner(&suiScore.id)
    }

    public entry fun pay_maintainer(maintainer: &mut SuiScoreMaintainer, ctx: &mut TxContext) {
        assert!(tx_context::sender(ctx) == maintainer.maintainer_address, ENotMaintainer);
        let amount = balance::value<SUI>(&maintainer.balance);
        assert!(amount > 0, ENoBalance);
        let payment = coin::take(&mut maintainer.balance, amount, ctx);
        transfer::public_transfer(payment, tx_context::sender(ctx));
    }

    public entry fun change_maintainer(maintainer: &mut SuiScoreMaintainer, new_maintainer: address, ctx: &mut TxContext) {
        assert!(tx_context::sender(ctx) == maintainer.maintainer_address, ENotMaintainer);
        maintainer.maintainer_address = new_maintainer;
    }

    public entry fun change_fee(maintainer: &mut SuiScoreMaintainer, new_fee: u64, ctx: &mut TxContext) {
        assert!(tx_context::sender(ctx) == maintainer.maintainer_address, ENotMaintainer);
        maintainer.fee = new_fee;
    }
}