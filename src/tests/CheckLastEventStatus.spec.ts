class CheckLastEventStatus {

    constructor(private readonly loadLastEventRepository: LoadLastEventRepository) {}
    async execute(group_id: string): Promise<void> {

    }
}

class LoadLastEventRepository {
    group_id?: string;
}

describe("CheckLastEventStatus", () => {
    it("should get last event data", async () => {
        const loadLastEventRepository = new LoadLastEventRepository();
        const checkLastEventStatus = new CheckLastEventStatus(loadLastEventRepository);

        await checkLastEventStatus.execute('any_group_id');

        expect(loadLastEventRepository.group_id).toBe('any_group_id');
    })
});