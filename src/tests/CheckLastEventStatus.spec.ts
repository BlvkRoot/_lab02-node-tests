class CheckLastEventStatus {

    constructor(private readonly loadLastEventRepository: ILoadLastEventRepository) {}
    async execute(group_id: string): Promise<void> {
        await this.loadLastEventRepository.loadLastEvent(group_id);
    }
}

interface ILoadLastEventRepository {
    loadLastEvent(group_id: string): Promise<void>;
}

class LoadLastEventRepositoryMock implements ILoadLastEventRepository{
    group_id?: string;
    callsCount = 0

    async loadLastEvent(group_id: string): Promise<void> {
        this.group_id = group_id;
        this.callsCount++;
    }
}

describe("CheckLastEventStatus", () => {
    it("should get last event data", async () => {
        const loadLastEventRepository = new LoadLastEventRepositoryMock();
        const sut = new CheckLastEventStatus(loadLastEventRepository);

        await sut.execute('any_group_id');

        expect(loadLastEventRepository.group_id).toBe('any_group_id');
        expect(loadLastEventRepository.callsCount).toBe(1);
    })
});