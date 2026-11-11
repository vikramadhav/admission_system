using DAHC.Applications.Service;

namespace DAHC.Test.Service;

public sealed class DashboardRulesTests
{
    [Fact]
    public void NoOpenProgram_DisablesStartNewWithNextOpening()
    {
        DateTimeOffset nextOpening = new(2027, 1, 10, 4, 0, 0, TimeSpan.Zero);

        StartNewApplicationState state = DashboardRules.EvaluateStartNew([], [], nextOpening);

        Assert.False(state.IsEnabled);
        Assert.Equal(StartNewDisabledReason.NoOpenProgram, state.DisabledReason);
        Assert.Equal(nextOpening, state.NextCycleOpensAt);
    }

    [Fact]
    public void ActiveApplicationInTheOnlyOpenCycle_DisablesStartNew()
    {
        StartNewApplicationState state = DashboardRules.EvaluateStartNew([7], [7], null);

        Assert.False(state.IsEnabled);
        Assert.Equal(StartNewDisabledReason.ActiveApplicationExists, state.DisabledReason);
    }

    [Fact]
    public void OpenCycleWithoutActiveApplication_EnablesStartNew()
    {
        StartNewApplicationState state = DashboardRules.EvaluateStartNew([7, 8], [7], null);

        Assert.True(state.IsEnabled);
        Assert.Null(state.DisabledReason);
    }
}
