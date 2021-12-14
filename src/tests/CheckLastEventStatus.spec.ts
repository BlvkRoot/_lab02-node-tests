class CheckLastEventStatus {

    constructor(private readonly loadLastEventRepository: ILoadLastEventRepository) {}
    async execute(group_id: string): Promise<string> {
        await this.loadLastEventRepository.loadLastEvent(group_id);
        return 'done';
    }
}

interface ILoadLastEventRepository {
    loadLastEvent(group_id: string): Promise<undefined>;
}

class LoadLastEventRepositorySpy implements ILoadLastEventRepository{
    group_id?: string;
    callsCount = 0;
    output: undefined;

    async loadLastEvent(group_id: string): Promise<undefined> {
        this.group_id = group_id;
        this.callsCount++;
        return this.output;
    }
}

describe("CheckLastEventStatus", () => {
    it("should get last event data", async () => {
        const loadLastEventRepository = new LoadLastEventRepositorySpy();
        const sut = new CheckLastEventStatus(loadLastEventRepository);

        await sut.execute('any_group_id');

        expect(loadLastEventRepository.group_id).toBe('any_group_id');
        expect(loadLastEventRepository.callsCount).toBe(1);
    })

    it("should return status done when group has no event", async () => {
        const loadLastEventRepository = new LoadLastEventRepositorySpy();
        loadLastEventRepository.output = undefined;
        const sut = new CheckLastEventStatus(loadLastEventRepository);

        const status = await sut.execute('any_group_id');

        expect(status).toBe('done');
    })
});