import type {
    AthleteState,
    OwlcmsAthlete,
    OwlcmsAthleteList,
} from './athlete';
import type {
    ClockState,
} from './clock';

import Athlete from './athlete';
import Clock from './clock';

export type BreakType =
    | 'BEFORE_INTRODUCTION'
    | 'CEREMONY'
    | 'CHALLENGE'
    | 'FIRST_CJ'
    | 'FIRST_SNATCH'
    | 'GROUP_DONE'
    | 'JURY'
    | 'MARSHAL'
    | 'SNATCH_DONE'
    | 'TECHNICAL';

export interface CategoryFederationRecords {
    federation: string;
    snatch: number;
    clean: number;
    total: number;
    snatchAttempt: boolean;
    cleanAttempt: boolean;
    totalAttempt: boolean;
}

export interface CategoryRecords {
    category: string[];
    data: CategoryFederationRecords[];
}

export type CeremonyType =
    | 'INTRODUCTION'
    | 'MEDALS'
    | 'OFFICIALS_INTRODUCTION';

export type Decision =
    | 'bad'
    | 'good';

export type FopState =
    | 'BREAK'
    | 'CURRENT_ATHLETE_DISPLAYED'
    | 'DECISION_VISIBLE'
    | 'DOWN_SIGNAL_VISIBLE'
    | 'INACTIVE'
    | 'TIME_RUNNING'
    | 'TIME_STOPPED';

export type LiftTypeKey =
    | 'CLEAN_AND_JERK'
    | 'SNATCH';

export type Mode =
    | 'BEFORE_INTRODUCTION'
    | 'CURRENT_ATHLETE'
    | 'FIRST_CJ'
    | 'FIRST_SNATCH'
    | 'INTRODUCTION'
    | 'LIFT_COUNTDOWN_CEREMONY'
    | 'LIFTING'
    | 'MARSHAL'
    | 'TECHNICAL'
    | 'WAIT';

export interface OwlcmsCategoryFederationRecords {
    cjHighlight: string;
    CLEANJERK: number;
    SNATCH: number;
    snatchHighlight: string;
    TOTAL: number;
    totalHighlight: string;
}

export interface OwlcmsCategoryRecords {
    cat: string[];
    records: OwlcmsCategoryFederationRecords[];
}

export type OwlcmsLiftType =
    | 'Clean_and_Jerk'
    | 'Snatch';

export interface OwlcmsRecords {
    recordCategories: string[];
    recordNames: string[];
    recordTable: OwlcmsCategoryRecords[];
}

export interface PlatformState {
    athlete: AthleteState | null;
    athleteClock: ClockState;
    breakClock: ClockState;
    breakType: BreakType | null;
    centerReferee: Decision | null;
    ceremonyType: CeremonyType | null;
    downSignal: boolean;
    fopState: FopState | null;
    juryDecision: Decision | null;
    juryReversal: boolean | null;
    leftReferee: Decision | null;
    liftType: string | null;
    liftTypeKey: LiftTypeKey | null;
    mode: Mode | null;
    name: string;
    recordKind: RecordKind;
    records: Records | null;
    rightReferee: Decision | null;
    sessionDescription: string | null;
    sessionInfo: string | null;
    sessionName: string | null;
}

export type RecordKind =
    | 'attempt'
    | 'denied'
    | 'new'
    | 'none';

export interface Records {
    federations: string[];
    categories: string[];
    records: CategoryRecords[];
}

export interface Session {
    description: string;
    info: string;
    name: string;
}

const JURY_DECISION_DURATION = 3_000;

export default class Platform {
    private static platforms = new Map<string, Platform>();

    private athletes = new Map<number, Athlete>();

    private athleteClock: Clock;

    private breakClock: Clock;

    private breakType: BreakType | null = null;

    private centerReferee: Decision | null = null;

    private ceremonyType: CeremonyType | null = null;

    private currentAthlete: Athlete | null = null;

    private currentSession: Session | null = null;

    private downSignal = false;

    private fopState: FopState = 'INACTIVE';

    private juryDecision: Decision | null = null;

    private juryReversal: boolean | null = null;

    private leftReferee: Decision | null = null;

    private liftingOrder: number[] = [];

    private liftType: string | null = null;

    private liftTypeKey: LiftTypeKey | null = null;

    private mode: Mode = 'WAIT';

    private name: string;

    private recordKind: RecordKind = 'none';

    private records: Records | null = null;

    private rightReferee: Decision | null = null;

    public static getPlatform(name: string, {
        noPersist = false,
    }: {
        noPersist?: boolean;
    } = {}): Platform {
        let platform = this.platforms.get(name);

        if (!platform) {
            platform = new Platform({
                name,
            });

            if (!noPersist) {
                this.platforms.set(name, platform);
            }
        }

        return platform;
    }

    public static getPlatforms(): string[] {
        return Array.from(this.platforms.keys());
    }

    public constructor({
        name,
    }: {
        name: string;
    }) {
        this.athleteClock = new Clock();
        this.breakClock = new Clock();
        this.name = name;
    }

    public getAthleteClock(): Clock {
        return this.athleteClock;
    }

    public getBreakClock(): Clock {
        return this.breakClock;
    }

    public getCurrentAthlete(): Athlete | null {
        return this.currentAthlete || null;
    }

    public getLiftingOrder(): Athlete[] {
        return this.liftingOrder.map((startNumber) => {
            return this.athletes.get(startNumber) as Athlete;
        });
    }

    public getState(): PlatformState {
        return {
            athlete: this.currentAthlete?.getState() || null,
            athleteClock: this.athleteClock.getState(),
            breakClock: this.breakClock.getState(),
            breakType: this.breakType,
            centerReferee: this.centerReferee,
            ceremonyType: this.ceremonyType,
            downSignal: this.downSignal,
            fopState: this.fopState,
            juryDecision: this.juryDecision,
            juryReversal: this.juryReversal,
            leftReferee: this.leftReferee,
            liftType: this.liftType,
            liftTypeKey: this.liftTypeKey,
            mode: this.mode,
            name: this.name,
            recordKind: this.recordKind,
            records: this.records,
            rightReferee: this.rightReferee,
            sessionDescription: this.currentSession?.description || null,
            sessionInfo: this.currentSession?.info || null,
            sessionName: this.currentSession?.name || null,
        };
    }

    public resetDecisions(): void {
        this.centerReferee = null;
        this.downSignal = false;
        this.leftReferee = null;
        this.rightReferee = null;
    }

    public setBreakType(breakType: BreakType | null): void {
        this.breakType = breakType;
    }

    public setCeremonyType(ceremonyType: CeremonyType | null): void {
        this.ceremonyType = ceremonyType;
    }

    public setCurrentAthlete(startNumber: number): void {
        this.currentAthlete = this.athletes.get(startNumber) || null;
    }

    public setDecisions({
        centerReferee,
        leftReferee,
        rightReferee,
    }: {
        centerReferee: Decision | null;
        leftReferee: Decision | null;
        rightReferee: Decision | null;
    }): void {
        this.downSignal = false;
        this.centerReferee = centerReferee;
        this.leftReferee = leftReferee;
        this.rightReferee = rightReferee;
    }

    public setDownSignal(state: boolean): void {
        this.downSignal = state;

        if (state) {
            this.centerReferee = null;
            this.leftReferee = null;
            this.rightReferee = null;
        }
    }

    public setFopState(fopState: FopState): void {
        this.fopState = fopState;
    }

    public setJuryDecision({
        decision,
        reversal,
    }: {
        decision: Decision;
        reversal: boolean;
    }) {
        this.juryDecision = decision;
        this.juryReversal = reversal;

        setTimeout(() => {
            this.juryDecision = null;
            this.juryReversal = null;
        }, JURY_DECISION_DURATION);
    }

    public setLiftType({
        key,
        name,
    }: {
        key: OwlcmsLiftType;
        name: string | null;
    }): void {
        this.liftTypeKey = (key?.toUpperCase() as LiftTypeKey) || null;
        this.liftType = name;
    }

    public setMode(mode: Mode): void {
        this.mode = mode;
    }

    public setRecordKind(recordKind: RecordKind): void {
        this.recordKind = recordKind || 'none';
    }

    public setRecords(records: OwlcmsRecords): void {
        if (!records) {
            this.records = null;
            return;
        }

        const federations = records.recordNames;

        this.records = {
            federations,
            categories: records.recordCategories,
            records: records.recordTable.map((record) => {
                return {
                    category: record.cat,
                    data: record.records.map((data, index) => {
                        return {
                            federation: federations[index],
                            snatch: data.SNATCH,
                            clean: data.CLEANJERK,
                            total: data.TOTAL,
                            snatchAttempt: !!data.snatchHighlight,
                            cleanAttempt: !!data.cjHighlight,
                            totalAttempt: !!data.totalHighlight,
                        };
                    }),
                };
            }),
        };
    }

    public setSession(session: {
        description: string;
        info: string;
        name: string;
    }): void {
        this.currentSession = session;
    }

    private updateAthlete(data: OwlcmsAthlete): Athlete {
        const startNumber = parseInt(data.startNumber);
        let athlete = this.athletes.get(startNumber);

        if (!athlete) {
            athlete = new Athlete(data);
        } else {
            athlete.update(data);
        }

        this.athletes.set(startNumber, athlete);

        return athlete;
    }

    public updateAthletes(athletes: OwlcmsAthleteList): void {
        const realAthletes = athletes.filter((athlete) => {
            return !('isSpacer' in athlete);
        }) as OwlcmsAthlete[];

        this.liftingOrder = realAthletes.map((athleteData: OwlcmsAthlete) => {
            const athlete = this.updateAthlete(athleteData);

            return athlete.getState().startNumber;
        });
    }
}
