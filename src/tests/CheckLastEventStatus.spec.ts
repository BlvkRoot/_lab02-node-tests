import { set, reset } from 'mockdate';

type TOutput = { endDate: Date, reviewDurationInHours?: number } | undefined;
type TEventStatus = { status: string };
class CheckLastEventStatus {

    constructor(private readonly loadLastEventRepository: ILoadLastEventRepository) {}
    async execute({ group_id } : {group_id: string}): Promise<TEventStatus> {
        const event = await this.loadLastEventRepository.loadLastEvent({group_id});
        if (event === undefined) return { status: 'done' };
        const now = new Date();
        return event.endDate >= now ? { status: 'active' } : { status: 'inReview' };
    }
}

interface ILoadLastEventRepository {
    loadLastEvent(input : { group_id: string }): Promise<TOutput>;
}

class LoadLastEventRepositorySpy implements ILoadLastEventRepository{
    group_id?: string;
    callsCount = 0;
    output: TOutput;

    setCurrentDateBeforeReviewTime(): void {
        const reviewDurationInHours = 1;
        const reviewDurationInMs = reviewDurationInHours * 60 * 60 * 1000;

        this.output = {
            endDate: new Date(new Date().getTime() - reviewDurationInMs + 1),
            reviewDurationInHours
        };
    }

    async loadLastEvent({ group_id } : { group_id: string }): Promise<TOutput> {
        this.group_id = group_id;
        this.callsCount++;
        return this.output;
    }
}

type sutOutput = { 
    sut: CheckLastEventStatus
    loadLastEventRepository: LoadLastEventRepositorySpy 
}

const makeSut = (): sutOutput => {
    const loadLastEventRepository = new LoadLastEventRepositorySpy();
    const sut = new CheckLastEventStatus(loadLastEventRepository);

    return { sut , loadLastEventRepository };
}

describe("CheckLastEventStatus", () => {
    const group_id = 'any_group_id';

    beforeAll(() => {
        set(new Date())
    })

    afterAll(() => {
        reset();
    })

    it("should get last event data", async () => {
        const { sut, loadLastEventRepository} = makeSut();

        await sut.execute({ group_id });

        expect(loadLastEventRepository.group_id).toBe(group_id);
        expect(loadLastEventRepository.callsCount).toBe(1);
    })

    it("should return status done when group has no event", async () => {
        const { sut, loadLastEventRepository} = makeSut();
        loadLastEventRepository.output = undefined;

        const { status } = await sut.execute({ group_id });

        expect(status).toBe('done');
    })

    it("should return status active when current date is before event end time", async () => {
        const { sut, loadLastEventRepository} = makeSut();
        loadLastEventRepository.output = {
            endDate: new Date(new Date().getTime() + 1)
        };

        const { status } = await sut.execute({ group_id });

        expect(status).toBe('active');
    })

    it("should return status active when current date is equal to event end time", async () => {
        const { sut, loadLastEventRepository} = makeSut();
        loadLastEventRepository.output = {
            endDate: new Date()
        };

        const { status } = await sut.execute({ group_id });

        expect(status).toBe('active');
    })

    it("should return status inReview when current date is after event end time", async () => {
        const { sut, loadLastEventRepository} = makeSut();
        loadLastEventRepository.output = {
            endDate: new Date(new Date().getTime() - 1)
        };

        const { status } = await sut.execute({ group_id });

        expect(status).toBe('inReview');
    })

    it("should return status inReview when current date is before review time", async () => {
        const { sut, loadLastEventRepository} = makeSut();
        loadLastEventRepository.setCurrentDateBeforeReviewTime();

        const { status } = await sut.execute({ group_id });

        expect(status).toBe('inReview');
    })
});